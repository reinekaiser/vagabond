import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import clsx from "clsx";
import React, { Suspense } from "react";

const RenderModel = ({ children, className }) => {
    return (
        <Canvas
            className={clsx("w-screen h-screen -z-10 relative", className)}
            shadows={false}
            dpr={[1, 2]}
            camera={{
                fov: 63, //độ rộng góc nhìn 
                near: 0.1,
                far: 100,
                position: [-4, 3, 4], //vị trí x y z trong không gian
            }}
        >
            <Suspense fallback={null}>
                <OrbitControls
                    autoRotate
                    autoRotateSpeed={6}
                    enableZoom={false}
                //minPolarAngle={Math.PI / 2} 
                //maxPolarAngle={Math.PI / 2} 
                />
                {children}
            </Suspense>
            {/* màu môi trường/thời tiết */}
            <Environment preset="dawn" />
        </Canvas>
    );
};

export default RenderModel;