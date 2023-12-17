import Webcam from "react-webcam";
import Image from "next/image";

type Props = {
  switcher: number;
};

export const ScreenSaver = ({ switcher }: Props) => {
  return (
    <>
      <Image
        src="/img/instruction.png"
        width={800}
        height={800}
        style={{ marginTop: "100px" }}
        alt="手前の台に手を近づけると、体験が始まります。"
      ></Image>

      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: -1,
        }}
      >
        {switcher == 0 ? (
          <iframe
            src="https://www.youtube.com/embed/FSAat-dstbQ?autoplay=1&mute=1"
            title="YouTube video player"
            style={{
              border: 0,
              width: "100vw",
              height: "100vh",
              opacity: 0.5,
            }}
          ></iframe>
        ) : (
          <Webcam //手指の動きを取得するのに必要なカメラ映像
            width={innerWidth}
            height={innerWidth}
            mirrored
            id="webcam"
            audio={false}
            screenshotFormat="image/jpeg"
            style={{
              marginTop: -innerWidth / 4,
              opacity: 0.3,
            }}
          />
        )}
      </div>
    </>
  );
};
