export const normalizeString = (string) => string.toString().replace(/[^a-zA-Z ]+/g, '').replace(/\s+/g, ' ');
export const slugify = (string, separator = "-") => string.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, separator);

export const base64 = (string) => {
    return {
        encode: () => {
            return Buffer.from(string, "utf8").toString("base64");
        },
        decode: () => {
            return Buffer.from(string, "base64").toString("utf8");
        },
        validate: () => {
            return typeof Buffer.from(string, "base64").toString("utf8") === string;
        }
    }
}

export const getServerUrl = (referer) => {
    const url = new URL(referer);
    return url.origin;
};