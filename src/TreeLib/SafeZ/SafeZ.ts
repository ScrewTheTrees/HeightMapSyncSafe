import {Hooks} from "../Hooks";
import {Entity} from "../Entity";

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

    public x = 0;
    public y = 0;

    public heightMap: number[][] = [];

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

    public routineFunc() {
        for (this.x = 0; this.x <= 480; this.x++) {
            for (this.y = 0; this.y <= 480; this.y++) {
                MoveLocation(this.loc, this.x, this.y);
                //GetLocalPlayer
                BlzSendSyncData(this.HEADER, ">" + this.x + ";" + this.y + ";" + GetLocationZ(this.loc));
            }
            coroutine.yield();
        }
    }

    step(): void {
        coroutine.resume(this.routine);
    }

    private onSyncTrigger() {
        let profix = BlzGetTriggerSyncPrefix();
        let data = BlzGetTriggerSyncData();

        if (data.endsWith("480")) {
            print(profix);
            print(data);
        }
    }
}