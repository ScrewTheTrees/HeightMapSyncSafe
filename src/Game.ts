import {Logger} from "./TreeLib/Logger";
import {TreeLib} from "./TreeLib/TreeLib";
import {SafeZ} from "./SafeZ/SafeZ";

export class Game {
    constructor() {
    }

    public run() {
        Logger.doLogVerbose = false;
        Logger.doLogDebug = true;

        xpcall(() => {
            let mapVersion = TreeLib.getMapVersion();
            print(`Build: ${mapVersion.major}.${mapVersion.minor}.${mapVersion.build}  ${mapVersion.date}`);
            SafeZ.getInstance();



        }, Logger.critical)
    }
}