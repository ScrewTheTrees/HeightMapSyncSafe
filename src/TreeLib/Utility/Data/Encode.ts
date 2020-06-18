export class Encode {

    private static readonly int16Offset = 32_000;

    public static Int16ToChar(num: number) {
        let wrx = string.char(num % 256);
        wrx += string.char((num >>> 8) % 256);
        wrx += this.int16Offset;

        return wrx;
    }

    public static StringToInt16(str: string) {
        let char1 = str.charAt(0);
        let char2 = str.charAt(1);

        let x = (string.byte(char1));
        x += (string.byte(char2) << 8);
        x -= this.int16Offset;

        return x;
    }
}