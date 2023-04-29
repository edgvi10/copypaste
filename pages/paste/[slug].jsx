import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NProgress from "nprogress";

import io from "socket.io-client"

import Header from "@/root/components/Header";
import Api from "@/root/src/services/api";
import { base64 } from "@/root/src/libs/utils";
import { date, strtotime } from "locutus/php/datetime";

export default function Home({ slug, ...props }) {
    const router = useRouter();
    const [loading, toggleLoading] = useState(false);
    const [paste, setPaste] = useState({});

    const [socket_server, setSocketServer] = useState(null);
    const [socket_connected, setSocketConnected] = useState(null);

    const [timeout_count, setTimeoutCount] = useState(0);
    const [abort_controller, setAbortToken] = useState(null);

    useEffect(() => {
        // se houver configuração de socket, iniciar conexão process.env.NEXT_PUBLIC_SOCKET_API_URL
        (async () => {
            const url = "https://db.edapp.com.br:3701"
            if (url) {
                const socket_server = io(`${url}`, {
                    transports: ["websocket"],
                    reconnection: true,
                    reconnectionDelay: 5000,
                    reconnectionDelayMax: 10000,
                    reconnectionAttempts: 3
                });

                socket_server.on("connect", () => {
                    console.log("connected", socket_server.id);
                    socket_server.emit("join", slug);

                    socket_server.on("copy", (data) => {
                        if (data.content) data.content = base64(data.content).decode();
                        console.log("received copy", data);
                        setPaste({ ...data });
                    });

                    setSocketServer(socket_server);

                    const socket_connected = true;
                    setSocketConnected(socket_connected);
                });
            } else {
                console.log("requesting paste manually");
                setSocketConnected(false);

                //getPasted();
            }

            // se não houver configuração de socket, iniciar requisição
            if (socket_connected === false) {
                console.log("requesting paste manually");
            }
        })();
    }, []);

    function handleContentChange(e) {
        const input = e.target;

        var key = input.name !== "" ? input.name : input.id;
        var value = input.value;

        const paste_update = { ...paste, [key]: value }
        setPaste({ ...paste_update });

        // se o socket estiver conectado, enviar o conteúdo para o servidor
        if (socket_connected) {
            clearTimeout(timeout_count);
            setTimeoutCount(setTimeout(() => {
                socket_server.emit("paste", slug, { content: base64(paste_update.content).encode() });
                //     // console.log("sending paste", { content: base64(paste_update.content).encode() });
            }, process.env.NEXT_PUBLIC_UPDATE_INTERVAL ?? 300));
        }
    };

    function getPasted() {
        NProgress.start();

        if (abort_controller) abort_controller.abort();
        const controller = new AbortController();
        setAbortToken(controller);

        Api.get(`/paste/${slug}`, { signal: controller.signal }).then(({ data }) => {
            const paste = data.data;
            paste.content = base64(paste.content).decode();
            setPaste({ ...paste });
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            NProgress.done();
            setAbortToken(null);
        });
    };

    function savePasted(paste_update = false) {
        NProgress.start();

        const payload = { ...paste };
        payload.content = base64(payload.content).encode();

        if (abort_controller) abort_controller.abort();
        const controller = new AbortController();
        setAbortToken(controller);

        Api.put(`/paste/${slug}`, payload, { signal: controller.signal }).then(({ data }) => {
            console.log("data", data);
            if (data.data.content) data.data.content = base64(data.data.content).decode();
            setPaste({ ...data.data });
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            NProgress.done();
            setAbortToken(null);
        });
    };

    return <main className="d-flex flex-column flex-fill">
        <Header title={slug} />

        <textarea className="form-control p-2 flex-fill small w-100 overflow-auto border-none rounded-0" name="content" value={paste.content ?? ""} onChange={handleContentChange} />
        <footer className="container-fluid d-flex flex-row gap-2 p-2 small border-top">
            <span><i className="fal fa-paste"></i> /{slug}</span>
            {/* fallback caso não tenha socket */}
            {!socket_connected && <>
                <button type="button" className="btn btn-success" onClick={() => savePasted()}>Save</button>
                <button type="button" className="btn btn-primary" onClick={() => getPasted()}>Read</button>
            </>}
            <span className="ms-auto"><i className="fal fa-clock" /> {loading ? <i className="fal fa-spinner-third fa-spin" /> : paste.updated_at ? date("d/m/y H:i:s", strtotime(paste.updated_at)) : "new or never"}</span>
        </footer>
    </main>
}

export async function getServerSideProps(context) {
    const props = {};
    const slug = context.query.slug;

    props.slug = slug;

    return { props };
}
