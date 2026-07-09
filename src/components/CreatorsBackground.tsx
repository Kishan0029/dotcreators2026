import creator1 from "@/assets/creator 1 (1).png";
import creator2 from "@/assets/creator 1 (2).png";
import creator3 from "@/assets/creator 1 (3).png";
import creator4 from "@/assets/creator 1 (4).png";
import creator5 from "@/assets/creator 1 (5).png";
import creator6 from "@/assets/creator 1 (6).png";

export default function CreatorsBackground() {
  return (
    <div className="absolute inset-x-0 top-0 z-0 w-full h-[100vh] min-h-[750px] sm:min-h-[900px] pointer-events-none overflow-hidden select-none">
      {/* Left Creators Group */}
      <div className="absolute left-0 bottom-0 h-full w-[45vw] max-w-[600px] flex items-end pointer-events-none">
        {/* Creator 1 (Far Left) */}
        <img
          src={creator1}
          alt=""
          className="absolute left-0 bottom-0 h-[50vh] lg:h-[65vh] object-contain object-bottom select-none z-1 opacity-80 hidden md:block"
        />
        {/* Creator 2 (Middle Left) */}
        <img
          src={creator2}
          alt=""
          className="absolute left-[12%] lg:left-[15%] bottom-0 h-[53vh] lg:h-[68vh] object-contain object-bottom select-none z-2 opacity-85 hidden md:block"
        />
        {/* Creator 3 (Front Left) */}
        <img
          src={creator3}
          alt=""
          className="absolute left-[-20px] md:left-[24%] lg:left-[30%] bottom-0 h-[42vh] md:h-[56vh] lg:h-[72vh] object-contain object-bottom select-none z-3 opacity-35 md:opacity-95"
        />
      </div>

      {/* Right Creators Group */}
      <div className="absolute right-0 bottom-0 h-full w-[45vw] max-w-[600px] flex items-end pointer-events-none">
        {/* Creator 4 (Front Right) */}
        <img
          src={creator4}
          alt=""
          className="absolute right-[-20px] md:right-[24%] lg:right-[30%] bottom-0 h-[42vh] md:h-[56vh] lg:h-[72vh] object-contain object-bottom select-none z-3 opacity-35 md:opacity-95"
        />
        {/* Creator 5 (Middle Right) */}
        <img
          src={creator5}
          alt=""
          className="absolute right-[12%] lg:right-[15%] bottom-0 h-[53vh] lg:h-[68vh] object-contain object-bottom select-none z-2 opacity-85 hidden md:block"
        />
        {/* Creator 6 (Far Right) */}
        <img
          src={creator6}
          alt=""
          className="absolute right-0 bottom-0 h-[50vh] lg:h-[65vh] object-contain object-bottom select-none z-1 opacity-80 hidden md:block"
        />
      </div>

      {/* Ambient gradient fade to blend with page background */}
      <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-background via-background/40 to-transparent z-10 pointer-events-none" />

      {/* Horizontal fade to ensure the center text remains fully readable on medium/narrow viewports */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-gradient-to-r from-transparent via-background/10 to-transparent opacity-50 z-10 pointer-events-none hidden max-md:block" />
    </div>
  );
}
