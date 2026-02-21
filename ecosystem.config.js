module.exports = {
    apps: [
        {
            name: "ozu-social",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
