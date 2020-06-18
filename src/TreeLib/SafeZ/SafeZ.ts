import {Hooks} from "../Hooks";
import {Entity} from "../Entity";
import {Logger} from "../Logger";

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

    private readonly offset = 32_000;

    public routineFunc() {
        let x = 0;
        let y = 0;

        xpcall(() => {
            for (x = this.mapXMin; x <= this.mapXMax; x++) {
                for (y = this.mapYMin; y <= this.mapYMax; y++) {

                    MoveLocation(this.loc, x, y);
                    //GetLocalPlayer
                    let sx = x + this.offset
                    let sy = y + this.offset
                    let sz = GetRandomInt(-800, 800) + this.offset;

                    let wrx = string.char(sx % 256) + string.char((sx >>> 8) % 256);
                    let wry = string.char(sy % 256) + string.char((sy >>> 8) % 256);
                    let wrz = string.char(sz % 256) + string.char((sz >>> 8) % 256);

                    //BlzSendSyncData(this.HEADER, wrx + wry + wrz);
                }
                coroutine.yield();
            }
        }, Logger.critical)

        let strt = "";
        for (let i = 0; i < 512; i++) {
            strt += "a";
        }

        BlzSendSyncData(this.HEADER, strt);

    }

    public num = 0;

    step(): void {
        if (!this.isFinished) this.num += this._timerDelay;
        coroutine.resume(this.routine);

        //print(this.num);
        //print(this.percent);
    }

    private onSyncTrigger() {
        let data = BlzGetTriggerSyncData();

        let x: number = (string.byte(data.charAt(0)) + (string.byte(data.charAt(1)) << 8)) - this.offset;
        let y: number = (string.byte(data.charAt(2)) + (string.byte(data.charAt(3)) << 8)) - this.offset;
        let z: number = (string.byte(data.charAt(4)) + (string.byte(data.charAt(5)) << 8)) - this.offset;

        this.percent = (x - this.mapYMin) / (this.mapXMax - this.mapYMin)

        if (data.length < 6) {
            Logger.warning("Data less than 6: ", x, y, z, data);
        }

        xpcall(() => {
            TerrainDeformCrater(x * 128, y * 128, 2, z, 1, true);
        }, (...args) => {
            Logger.critical(...args);
        });

        if (x == this.mapXMax && y == this.mapYMax) {
            this.isFinished = true;
        }


    }
}