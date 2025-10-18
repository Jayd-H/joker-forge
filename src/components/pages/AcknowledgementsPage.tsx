import { HeartIcon } from "@heroicons/react/24/solid";

const AcknowledgementsPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="p-8 font-lexend max-w-7xl mx-auto">
        <h1 className="text-3xl text-white-light mb-4 tracking-widest text-center">
          Acknowledgements
        </h1>
        <HeartIcon className="h-12 w-12 text-mint mx-auto mb-4" />
        <p className="text-white text-lg mt-6">
          Core Technologies behind this site:
        </p>
        <ul className="list-disc list-inside text-white mt-4">
          <li>
            <a
              href="https://reactjs.org/"
              className="text-mint hover:underline"
            >
              React
            </a>
          </li>
          <li>
            <a
              href="https://tailwindcss.com/"
              className="text-mint hover:underline"
            >
              Tailwind CSS
            </a>
          </li>
          <li>
            <a
              href="https://heroicons.com/"
              className="text-mint hover:underline"
            >
              Heroicons
            </a>
          </li>
          <li>
            <a href="https://motion.dev/" className="text-mint hover:underline">
              Framer-Motion
            </a>
          </li>
        </ul>

        <p className="text-white-dark text-lg mt-6">
          Main Developers:
        </p>
        <ul className="list-disc list-inside text-white-dark mt-4">
          <li>
            <a
              href="https://github.com/Jayd-H"
              className="text-condition hover:underline"
            >
              Jayden Holdsworth
            </a>
          </li>
          <li>
            <a
              className="text-condition"
            >
              Taylor
            </a>
          </li>
        <p className="text-white-dark text-lg mt-6">
        Main Contributors:
        </p>
        <ul className="list-disc list-inside text-white-dark mt-4">
          <li>
            <a
              href="https://github.com/EasternFarmer"
              className="text-condition hover:underline"
            >
              Eastern Farmer
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Butterstutter"
              className="text-condition hover:underline"
            >
              ButterStutter
            </a>
          </li>
          <li>
            <a
              href="https://github.com/cavoshoki"
              className="text-condition hover:underline"
            >
              CavoShoku
            </a>
          </li>
          <li>
            <a
              className="text-condition"
            >
              PATO FOFO
            </a>
          </li>
        </ul>
        </ul>

        <p className="text-white text-lg text-center  mt-10">
          Huge thanks to the guys over at the{" "}
          <a
            href="https://discord.com/invite/balatro"
            className="text-mint hover:underline"
          >
            Balatro discord server
          </a>{" "}
          for their help and support during development.
        </p>
        <p className="text-white-dark text-lg mt-6">
          Particularly great resoruces for learning SMODS:
        </p>
        <p className="text-white-darker font-light text-sm">
          (And just some mods I like in general)
        </p>
        <ul className="list-disc list-inside text-white-dark mt-4">
          <li>
            <a
              href="https://github.com/Steamodded/smods/wiki"
              className="text-mint hover:underline"
            >
              SMODS Documentation
            </a>
          </li>
          <li>
            <a
              href="https://github.com/nh6574/VanillaRemade"
              className="text-mint hover:underline"
            >
              Vanilla Remade
            </a>
          </li>
          <li>
            <a
              href="https://github.com/GuilloryCraft/ExtraCredit"
              className="text-mint hover:underline"
            >
              Extra Credit
            </a>
          </li>
          <li>
            <a
              href="https://github.com/thefaketh30ne/grab-bag"
              className="text-mint hover:underline"
            >
              Grab Bag
            </a>
          </li>
          <li>
            <a
              href="https://github.com/WilsontheWolf/DebugPlus"
              className="text-mint hover:underline"
            >
              Debug Plus
            </a>
          </li>
          <li>
            <a
              href="https://github.com/SleepyG11/HandyBalatro"
              className="text-mint hover:underline"
            >
              Handy
            </a>
          </li>
        </ul>

        <p className="text-white-dark text-lg mt-6 text-center">
          Joker Forge would not be possible without Balatro itself, so thanks to{" "}
          <a
            href="https://localthunk.com/"
            className="text-mint hover:underline"
          >
            LocalThunk
          </a>
          .
        </p>
        <p className="text-white-dark text-center text-sm mt-8">
          Icon from FlatIcon
        </p>
        <p className="text-white-dark text-center text-sm">
          This project is licensed under the{" "}
          <a
            href="https://opensource.org/license/mit/"
            className="text-mint hover:underline"
          >
            MIT License
          </a>
          . Go wild with it!
        </p>
      </div>
    </div>
  );
};

export default AcknowledgementsPage;
