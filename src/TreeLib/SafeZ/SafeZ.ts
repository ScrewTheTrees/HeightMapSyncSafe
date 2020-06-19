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

    public mapXMin = math.floor(GetRectMinX(GetEntireMapRect()) / 128);
    public mapYMin = math.floor(GetRectMinY(GetEntireMapRect()) / 128);
    public mapXMax = math.floor(GetRectMaxX(GetEntireMapRect()) / 128);
    public mapYMax = math.floor(GetRectMaxY(GetEntireMapRect()) / 128);
    public heightMap: number[][] = [];
    public isFinished = false;
    public percent: number = 0;
    public routine = coroutine.create(() => this.routineFunc());
    public loc: location = Location(0, 0);
    public offset: number = 8;

    constructor() {
        super();
        BlzTriggerRegisterPlayerSyncEvent(this.onSync, Player(0), this.HEADER, false);
        BlzTriggerRegisterPlayerSyncEvent(this.onSync, Player(1), this.HEADER, false);
        TriggerAddAction(this.onSync, () => this.onSyncTrigger());
    }

    private mapSet(x: number, y: number, value) {
        if (this.heightMap[x] == null) this.heightMap[x] = [];

        this.heightMap[x][y] = value;
    }

    public GetZ(x: number, y: number) {
        x = math.floor(x / 128);
        y = math.floor(y / 128);
        if (this.heightMap[x] == null) return 0;
        return this.heightMap[x][y] || 0;
    }



    public routineFunc() {
        let x = 0;
        let y = 0;
        let assemble = "";


        for (x = this.mapXMin; x <= this.mapXMax; x += this.offset) {
            for (y = this.mapYMin; y <= this.mapYMax; y += this.offset) {
                xpcall(() => {
                    let data = this.makeChunkData(x, y, this.offset, this.offset);
                    assemble = Encode.Compress14BitChunk(x, y, this.offset, this.offset, data);

                    BlzSendSyncData(this.HEADER, assemble);
                    assemble = "";
                    coroutine.yield();

                }, Logger.critical)
            }
        }
    }

    public makeChunkData(x: number, y: number, width: number, height: number) {
        let data: number[][] = [];
        for (let i = 0; i < width; i++) {
            data[i] = [];
            for (let j = 0; j < height; j++) {
                MoveLocation(this.loc, (x + i) * 128, (y + j) * 128);
                let z = math.floor(GetLocationZ(this.loc));
                z = GetRandomInt(-600, 600);
                data[i][j] = z;
            }
        }
        return data;
    }

    public num = 0;

    step(): void {
        if (!this.isFinished) this.num += this._timerDelay;
        coroutine.resume(this.routine);

        print(this.percent);
        print(this.num);
    }

    private onSyncTrigger() {
        let data = BlzGetTriggerSyncData();

        xpcall(() => {

            let decompressed = Encode.Decompress14BitChunk(data);
            let x = decompressed.x;
            let y = decompressed.y;
            let width = decompressed.width;
            let height = decompressed.height;

            ClearTextMessages();

            print(y - this.mapYMin, this.mapYMax - this.mapYMin);
            print(x - this.mapXMin, this.mapXMax - this.mapXMin);

            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {

                    let value = decompressed.data[i][j];

                    this.percent = (x - this.mapXMin) / (this.mapXMax - this.mapXMin)
                    this.mapSet(i, j, value);

                    TerrainDeformCrater((x + i) * 128, (y + j) * 128, 2, value, 1, true);


                    if (x + i >= this.mapXMax) {
                        this.isFinished = true;
                        this.percent = 1;
                    }

                }
            }
        }, (...args) => {
            Logger.critical(...args);
        });

    }
}