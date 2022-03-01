export default function Paste() {
    return <></>;
}

export async function getServerSideProps(context) {
    console.clear();
    const slug = context.query.slug;
    if (!slug) {
        // const res = context.res;
        // res.setHeader("location", "/");
        // res.statusCode = 302;
        // res.end();
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
            props: {},
        };
    } else {
        return { props: { slug } };
    }
}