export const CITY_OPTIONS = [
    {
        _id: "67ea13d95744b8dbf52bbde8",
        name: "Thành phố HCM",
    },
    {
        _id: "67e2c26df2f416cf8a54fdf3",
        name: "Hà Nội",
    },
];

export const LANGUAGE_OPTIONS = [
    { label: "Tiếng Việt", value: "200" },
    { label: "Tiếng Anh", value: "201" },
    { label: "Tiếng Trung", value: "202" },
    { label: "Tiếng Hàn", value: "203" },
];

export const CATEGORY_OPTIONS = [
    { label: "Thiên nhiên", value: "100" },
    { label: "Ngắm cảnh", value: "101" },
    { label: "Nghệ thuật & Văn hoá", value: "102" },
    { label: "Tour dưới nước", value: "103" },
    { label: "Tour trên đất liền", value: "104" },
    { label: "Tour ẩm thực", value: "105" },
    { label: "Tour theo chủ đề", value: "106" },
    { label: "Tour nửa ngày", value: "107" },
    { label: "Khám phá đảo", value: "108" },
    { label: "Tour bằng xe buýt", value: "109" },
];

export const DURATION_OPTIONS = [
        { label: "0-3 tiếng", value: "0-3" },
        { label: "3-5 tiếng", value: "3-5" },
        { label: "5-7 tiếng", value: "5-7" },
        { label: "1 ngày", value: "1-day" },
        { label: "Từ hai ngày trở lên", value: "2-day-plus" },
    ];


export const SORT_OPTIONS = [
        { label: "Mới nhất", value: "newest" },
        { label: "Phổ biến nhất", value: "popular" },
        { label: "Đánh giá cao nhất", value: "rating" },
        { label: "Giá từ thấp đến cao", value: "price" },
    ];
export const TICKET_DETAILS = {
    title: "Tour ghép - Nhóm lớn (Tối đa 29 khách) - Khởi hành thành phố Hồ Chí Minh",
    subtitle: "",
    description:
        "Tour kéo dài 6 giờ, có dịch vụ đón và trả khách miễn phí tại một số khu vực ở Quận 1, TP.HCM, trong khi khách ngoài khu vực này cần có mặt tại 57 Lê Thị Hồng Gấm trước 15 phút so với giờ khởi hành.",
    prices: [
        {
            priceType: "Người lớn",
            price: 562500,
            notes: "Trên 9 tuổi",
            minPerBooking: 1,
            maxPerBooking: 20,
        },
    ],
    maxPerBooking: "",
    overview:
        '<h3><span style="color: rgb(0, 0, 0);">Giá đã bao gồm</span></h3><p><span style="color: rgb(3, 18, 26);">Hướng dẫn viên </span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Hướng dẫn viên nói tiếng Việt và Anh</span></li></ol><p><span style="color: rgb(3, 18, 26);">Bữa ăn </span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">1 chai nước suối</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trà và sắn</span></li></ol><p><span style="color: rgb(3, 18, 26);">Phương tiện di chuyển</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Xe buýt có điều hoà</span></li></ol><p><span style="color: rgb(3, 18, 26);">Dịch vụ khác</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Chi phí tham quan</span></li></ol><h3><span style="color: rgb(0, 0, 0);">Giá không bao gồm</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Phí bắn súng</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Ăn uống ngoài chương trình</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Bảo hiểm du lịch</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Tiền tip</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Chi tiêu cá nhân</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Các chi phí khác không được đề cập</span></li></ol><p><br></p>',
    voucherValidity:
        "Có hiệu lực vào mọi ngày bình thường\nCó hiệu lực vào mọi ngày lễ",
    redemptionPolicy: {
        method: '<p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">1. Xuất trình voucher trên điện thoại cho nhân viên kiểm tra. Điều chỉnh độ sáng nếu cần.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">2. Xuất trình giấy tờ tùy thân bản gốc và hợp lệ để xác minh.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">3. Chỉ chấp nhận voucher hợp lệ. Biên lai hoặc bằng chứng thanh toán không được sử dụng để vào cổng.</span></p><p><br></p>',
        location: null,
    },
    cancellationPolicy: {
        isReschedule: false,
        reschedulePolicy: "",
        isRefund: true,
        refundPolicy: {
            refundPercentage: [{ daysBefore: "", percent: "" }],
            description:
                "Tất cả thời gian được tính theo giờ hoạt động tại địa phương.\nSố tiền hoàn lại cuối cùng sẽ không bao gồm phí dịch vụ, phiếu giảm giá và / hoặc phí chuyển khoản ngân hàng mã duy nhất.\nĐể hủy đặt chỗ của bạn và yêu cầu hoàn tiền, vui lòng truy cập mục Đặt chỗ của tôi. Trong phần Quản lý đặt chỗ, chạm vào Hoàn tiền và thực hiện theo quy trình gửi hoàn tiền (có trên Ứng dụng Traveloka phiên bản 3.18 trở lên hoặc trang web Traveloka trên máy tính).",
        },
    },
    termsAndConditions:
        '<h3><strong style="color: rgb(0, 0, 0);">Thông tin chung</strong></h3><p><span style="color: rgb(3, 18, 26);">Chính sách miễn phí vé</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trẻ em dưới 5 tuổi được miễn phí vé vào cửa. Nếu ngồi riêng trên xe buýt, phụ thu 200.000 VND/trẻ.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Hiệu lực và chuyển nhượng vé</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Vé trẻ em áp dụng cho du khách từ 5 – 9 tuổi.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Vé người lớn áp dụng cho du khách từ 10 tuổi trở lên.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Yêu cầu giấy tờ tùy thân</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">SST Travel có quyền từ chối nhập cảnh nếu du khách không xuất trình giấy tờ tùy thân hợp lệ (CMND, hộ chiếu, v.v.).</span></li></ol><p><span style="color: rgb(3, 18, 26);">Điều kiện tham gia</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trẻ em phải luôn đi cùng người lớn trong suốt chuyến tham quan.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Lựa chọn thời gian tham gia</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Nhà điều hành tour sẽ liên hệ với du khách trong vòng 24 giờ sau khi đặt vé để xác nhận và cung cấp thông tin chi tiết. Nếu đặt vé vào ngày lễ/cuối tuần, thông tin sẽ được gửi vào ngày làm việc tiếp theo.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Không có mặt khi đón khách</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Nếu du khách vắng mặt tại điểm đón, tour sẽ khởi hành và đặt chỗ bị hủy. Việc dời lịch có thể được xem xét dựa trên sự chấp thuận và tình trạng chỗ trống của nhà điều hành.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Thời tiết và bảo trì</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Lịch trình có thể thay đổi tùy theo điều kiện thời tiết, giao thông hoặc các tình huống bất khả kháng khác.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Quy tắc an toàn và hành vi</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trong mọi loại hình tour, du khách phải tuân thủ lịch trình và hướng dẫn của trưởng đoàn.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Các điều khoản khác</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Tour ghép có thể có những du khách khác mà bạn chưa quen biết, trong khi tour riêng chỉ dành cho nhóm của bạn.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Phương tiện di chuyển có thể thay đổi, nhà điều hành sẽ thay thế bằng dịch vụ tương đương dựa trên tình trạng sẵn có và tiêu chuẩn cam kết.</span></li></ol>',
};
