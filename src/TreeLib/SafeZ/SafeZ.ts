import {Hooks} from "../Hooks";
import {Entity} from "../Entity";
import {Logger} from "../Logger";
import {Encode} from "../Utility/Data/Encode";

export class SafeZ extends Entity {
    private static instance: SafeZ;


    public static getInstance() {
        if (this.instance == null) {
            this.instance = new SafeZ();
            Hooks.set(this.name, this.instance);
        }
        return this.instance;
    }

    public HEADER = "S_Z";

    public onSync: trigger = CreateTrigger();

    constructor() {
        super();
        BlzTriggerRegisterPlayerSyncEvent(this.onSync, Player(0), this.HEADER, false);
        BlzTriggerRegisterPlayerSyncEvent(this.onSync, Player(1), this.HEADER, false);
        TriggerAddAction(this.onSync, () => this.onSyncTrigger());
    }


    public heightMap: number[][] = [];
    public isFinished = false;
    public percent: number = 0;

    public routine = coroutine.create(() => this.routineFunc());
    public loc: location = Location(0, 0);

    public mapSet(x: number, y: number, value) {
        if (this.heightMap[x] == null) this.heightMap[x] = [];

        this.heightMap[x][y] = value;
    }

    public mapGet(x: number, y: number) {
        if (this.heightMap[x] == null) return 0;
        return this.heightMap[x][y] || 0;
    }

    public mapXMin = math.floor(GetRectMinX(GetEntireMapRect()) / 128);
    public mapYMin = math.floor(GetRectMinY(GetEntireMapRect()) / 128);
    public mapXMax = math.floor(GetRectMaxX(GetEntireMapRect()) / 128);
    public mapYMax = math.floor(GetRectMaxY(GetEntireMapRect()) / 128);

    public routineFunc() {
        let x = 0;
        let y = 0;
        let assemble = "";

        for (x = this.mapXMin; x <= this.mapXMax; x++) {
            for (y = this.mapYMin; y <= this.mapYMax; y++) {
                xpcall(() => {
                    MoveLocation(this.loc, x, y);

                    let z = math.floor(GetLocationZ(this.loc));
                    let wrx = Encode.Int14ToChars(x);
                    let wry = Encode.Int14ToChars(y);
                    let wrz = Encode.Int14ToChars(z);

                    assemble += wrx + wry + wrz;

                    if (assemble.length >= 240) {
                        BlzSendSyncData(this.HEADER, assemble);

                        assemble = "";
                        coroutine.yield();
                    }
                }, Logger.critical)
            }
        }
        BlzSendSyncData(this.HEADER, assemble); //Final message
    }

    public num = 0;

    step(): void {
        if (!this.isFinished) this.num += this._timerDelay;
        coroutine.resume(this.routine);
    }

    private onSyncTrigger() {
        let data = BlzGetTriggerSyncData();

        for (let i = 0; i <= data.length - 6; i += 6) {
            xpcall(() => {
                let x: number = Encode.StringToInt14(data.substr(i, 2));
                let y: number = Encode.StringToInt14(data.substr(i + 2, 2));
                let z: number = Encode.StringToInt14(data.substr(i + 4, 2));

                this.percent = (x - this.mapYMin) / (this.mapXMax - this.mapYMin)

                this.mapSet(x, y, z);

                if (x == this.mapXMax && y == this.mapYMax) {
                    this.isFinished = true;
                }
            }, (...args) => {
                Logger.critical(...args);
            });
        }


    }
}