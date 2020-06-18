export class Encode {

    private static readonly int16Offset = 32_767;
    private static readonly int14Offset = 8_191;

    public static Int16ToChars(num: number): string {
        let num1 = (num + this.int16Offset) % 256;
        let num2 = ((num + this.int16Offset >>> 8)) % 256;

        return string.char(num1)
            + string.char(num2);
    }

    public static StringToInt16(str: string): number {
        let char1 = str.charAt(0);
        let char2 = str.charAt(1);

        let x = (string.byte(char1));
        x += (string.byte(char2) << 8);
        x -= this.int16Offset;

        return x;
    }

    //This is only to allow safe network sending of data, since null terminated strings
    //Ruins the string by terminating it early.
    public static Int14ToChars(num: number): string {
        let num1 = ((num + this.int14Offset) % 128) + 64;
        let num2 = (((num + this.int14Offset >>> 7)) % 128) + 64;

        return string.char(num1)
            + string.char(num2);
    }

    //Unpack these special char ints on the other side.
    public static StringToInt14(str: string): number {
        let char1 = str.charAt(0);
        let char2 = str.charAt(1);

        let x = (string.byte(char1) - 64);
        x += ((string.byte(char2) - 64) << 7);
        x -= this.int14Offset;

        return x;
    }
}