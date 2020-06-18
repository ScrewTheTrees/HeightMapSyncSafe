export class CSV {
    public static Parse(parse: string, delimiter: string = ";"): string[] {
        let values: string[] = [];
        let current: string = "";
        for (let i = 0; i < parse.length; i++) {
            if (parse.charAt(i) == delimiter) {
                values.push(current);
            } else {
                current += parse.charAt(i);
            }
        }
        values.push(current);

        return values;
    }
}