import { OpenAIEmbeddings } from "@langchain/openai";
import { TavilySearch } from "@langchain/tavily";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import { z } from "zod";

// === Exported Function ===
export async function callAgent(query, threadId) {
    const GraphState = Annotation.Root({
        messages: Annotation({
            reducer: (left, right) => {
                return Array.isArray(right) ? left.concat(right) : left.concat([right]);
            },
            default: () => [],
        }),
    });

    const tourLookupTool = tool(
        async ({ query, n = 5 }) => {
            console.log(query);
            const vectorStore = new MongoDBAtlasVectorSearch(
                new OpenAIEmbeddings({
                    modelName: "text-embedding-3-small",
                }),
                {
                    collection: mongoose.connection.collection("tour_vectors"),
                    indexName: "vector_index",
                    textKey: "embedding_text",
                    embeddingKey: "embedding",
                }
            );

            console.log("Employee lookup tool called");

            const results = await vectorStore.similaritySearchWithScore(query, n);
            console.log(results);
            return JSON.stringify(results);
        },
        {
            name: "tour_lookup",
            description: "Tìm kiếm thông tin tour theo độ tương đồng nội dung",
            schema: z.object({
                query: z.string().describe("The user’s search query"),
                n: z.number().optional().default(5),
            }),
        }
    );

    const travelExperienceTool = new TavilySearch({
        maxResults: 2,
        name: "travel_experience_search",
        description:
            "Tìm kiếm kinh nghiệm du lịch từ Internet, bao gồm review, chia sẻ, và lời khuyên khi đi tour.",
    });

    const tools = [tourLookupTool, travelExperienceTool];
    const toolNode = new ToolNode(tools);

    const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0 }).bindTools(tools);

    function shouldContinue(state) {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage.tool_calls?.length) return "tools";
        return "__end__";
    }

    async function callModel(state) {
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `Bạn là trợ lý ảo thông minh, có nhiệm vụ hỗ trợ người dùng tìm kiếm thông tin về tour du lịch. 
Bạn có thể:
- dùng "tour_lookup" để tìm thông tin tour từ cơ sở dữ liệu
- dùng "travel_experience_search" để tìm kinh nghiệm từ Internet.
Khi gợi ý tour sử dụng "tour_lookup", chỉ cần gợi ý một tour và hãy đảm bảo trả về trường _id được lấy từ metadata của kết quả similarity search và câu trả lời luôn phải có phải **chèn thêm dòng hoặc cụm có định dạng**: "tourId: <_id>".
Trả lời chính xác, ngắn gọn và hữu ích.`,
            ],
            new MessagesPlaceholder("messages"),
        ]);

        const formatted = await prompt.formatMessages({
            tool_names: tools.map((t) => t.name).join(", "),
            time: new Date().toISOString(),
            system_message: "Hỗ trợ người dùng với thông tin tour",
            messages: state.messages,
        });

        const result = await model.invoke(formatted);
        return { messages: [result] };
    }

    // === Create Workflow ===
    const workflow = new StateGraph(GraphState)
        .addNode("agent", callModel)
        .addNode("tools", toolNode)
        .addEdge("__start__", "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", "agent");

    const app = workflow.compile({
        checkpointer: new MongoDBSaver({
            client: mongoose.connection.getClient(),
            dbName: mongoose.connection.db.databaseName,
        }),
    });

    const result = await app.invoke(
        { messages: [new HumanMessage(query)] },
        { recursionLimit: 10, configurable: { thread_id: threadId } }
    );

    const finalMessage = result.messages[result.messages.length - 1];

    return finalMessage.content;
}
