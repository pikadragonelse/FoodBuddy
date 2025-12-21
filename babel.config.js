module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            "nativewind/babel",
            "react-native-reanimated/plugin", // <--- Dòng này quan trọng, phải để cuối cùng
        ],
    };
};