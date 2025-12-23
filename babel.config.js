module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            "nativewind/babel",
            // Plugin cho Drizzle ORM để import SQL migration files
            ["inline-import", { "extensions": [".sql"] }],
            "react-native-reanimated/plugin", // <--- Dòng này quan trọng, phải để cuối cùng
        ],
    };
};