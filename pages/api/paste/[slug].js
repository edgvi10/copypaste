import DBWalker from "linkdevs-db-walker";
import { base64 } from "@/root/src/libs/utils";
import { v4 as uuidv4 } from "uuid";
import { strtotime, date } from "locutus/php/datetime";

const getPaste = async (params) => {
    const db = new DBWalker();

    const select_paste_params = {};
    select_paste_params.table = "copypaste";
    select_paste_params.columns = ["*"];
    select_paste_params.where = [`slug = '${params.slug}'`];

    const select_paste_sql = db.buildSelect(select_paste_params);
    const select_paste_result = await db.query(select_paste_sql);

    return select_paste_result;
};

const insertPaste = async (data) => {
    const db = new DBWalker();

    const insert_paste_params = {};
    insert_paste_params.table = "copypaste";
    const insert_paste_params_data = {};

    insert_paste_params_data.uuid = data.uuid ?? uuidv4();
    if (data.slug) insert_paste_params_data.slug = data.slug;
    insert_paste_params_data.content = data.content ?? "";
    if (data.expire) insert_paste_params_data.expire = data.expire;
    insert_paste_params_data.privacy = data.privacy ?? "public";
    if (data.password) insert_paste_params_data.password = data.password;
    insert_paste_params_data.updated_at = data.updated_at ?? date("Y-m-d H:i:s");
    insert_paste_params_data.created_at = data.created_at ?? date("Y-m-d H:i:s");

    insert_paste_params.data = [insert_paste_params_data];

    const insert_paste_sql = db.buildInsert(insert_paste_params);
    const insert_paste_result = await db.query(insert_paste_sql);

    return insert_paste_result;
};

const updatePaste = async (params, data) => {
    const db = new DBWalker();

    const update_paste_params = {};
    update_paste_params.table = "copypaste";
    update_paste_params.where = [`slug = '${params.slug}'`];
    update_paste_params.data = {};

    if (data.content) update_paste_params.data.content = data.content;
    if (data.expire) update_paste_params.data.expire = data.expire;
    if (data.privacy) update_paste_params.data.privacy = data.privacy;
    if (data.password) update_paste_params.data.password = data.password;
    update_paste_params.data.updated_at = data.updated_at ?? date("Y-m-d H:i:s");

    const update_paste_sql = db.buildUpdate(update_paste_params);
    const update_paste_result = await db.query(update_paste_sql);

    return update_paste_result;
};

export default async function (req, res) {
    console.clear();
    console.log(`${req.method} ${req.url}`, req.query, req.body);

    const response = {};
    response.statusCode = 405;

    if (req.method === "GET") {
        const params = { ...req.query, ...req.body };

        const select_paste = await getPaste(params);
        if (select_paste.error) {
            response.statusCode = 500;
            response.debug = select_paste;
        } else {
            if (select_paste.length > 0) {
                console.log("read paste", select_paste[0]);
                response.statusCode = 200;
                response.data = select_paste[0];
            } else {
                console.log("create paste", params);
                const insert_paste = await insertPaste({ slug: params.slug });
                if (insert_paste.error) {
                    response.statusCode = 500;
                    response.debug = insert_paste;
                } else {
                    if (insert_paste.affectedRows > 0) {
                        response.statusCode = 201;
                        response.data = { id: insert_paste.insertId, slug: params.slug, content: "" };
                        console.log("created paste", response.data);
                    } else {
                        response.statusCode = 500;
                        response.debug = insert_paste;
                    }
                }
            }
        }

        return res.status(response.statusCode).json({ ...response });
    } else if (req.method === "POST") {
        const params = { ...req.query, ...req.body };

        const select_paste = await getPaste(params);
        if (select_paste.error) {
            response.statusCode = 500;
            response.debug = select_paste;
        } else {
            if (select_paste.length > 0) {
                response.statusCode = 406;
                response.message = "Paste already exists";
                response.data = select_paste[0];
            } else {
                const insert_paste = await insertPaste({ slug: params.slug, content: params.content });
                if (insert_paste.error) {
                    response.statusCode = 500;
                    response.debug = insert_paste;
                } else {
                    if (insert_paste.affectedRows > 0) {
                        response.statusCode = 201;
                        response.data = { id: insert_paste.insertId, slug: params.slug, content: "" };
                    } else {
                        response.statusCode = 500;
                        response.debug = insert_paste;
                    }
                }
            }
        }

        return res.status(response.statusCode).json({ ...response });
    } else if (req.method === "PUT") {
        const params = { ...req.query, ...req.body };

        const select_paste = await getPaste(params);
        if (select_paste.error) {
            response.statusCode = 500;
            response.debug = select_paste;
        } else {
            const current_time = date("Y-m-d H:i:s");
            if (select_paste.length > 0) {
                const update_paste = await updatePaste(params, { content: params.content });
                if (update_paste.error) {
                    response.statusCode = 500;
                    response.debug = update_paste;
                } else {
                    if (update_paste.affectedRows > 0) {
                        response.statusCode = 200;
                        response.data = { slug: params.slug, content: params.content };
                    } else {
                        response.statusCode = 500;
                        response.debug = update_paste;
                    }
                }
            } else {
                const insert_paste = await insertPaste({ slug: params.slug, content: params.content });
                if (insert_paste.error) {
                    response.statusCode = 500;
                    response.debug = insert_paste;
                } else {
                    if (insert_paste.affectedRows > 0) {
                        response.statusCode = 201;
                        response.paste = { id: insert_paste.insertId, slug: params.slug, content: params.content, updated_at: current_time };
                    } else {
                        response.statusCode = 500;
                        response.debug = insert_paste;
                    }
                }
            }
        }

        return res.status(response.statusCode).json({ ...response });
    } else if (req.method === "DELETE") {
    }

    return res.status(405).json({ ...response, message: "Method Not Allowed" });
}