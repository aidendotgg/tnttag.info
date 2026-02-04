export function getColor(color: string, defaultColor: string) {
    const colorMap = new Map<string, string>([
        ["RED", "#FF5555"],
        ["GOLD", "#FFAA00"],
        ["GREEN", "#55FF55"],
        ["YELLOW", "#FFFF55"],
        ["LIGHT_PURPLE", "#FF55FF"],
        ["WHITE", "#FFFFFF"],
        ["BLUE", "#5555FF"],
        ["DARK_GREEN", "#00AA00"],
        ["DARK_RED", "#AA0000"],
        ["DARK_AQUA", "#00AAAA"],
        ["AQUA", "#55FFFF"],
        ["DARK_PURPLE", "#AA00AA"],
        ["DARK_GRAY", "#555555"],
        ["GRAY", "#AAAAAA"],
        ["BLACK", "#000000"],
        ["DARK_BLUE", "#0000AA"],
    ]);

    if (!color) return defaultColor
    return colorMap.get(color.toUpperCase());
}

export function getRank(player: any) {
    let rank = player.newPackageRank ?? player.packageRank ?? "NONE"

    if (player.newPackageRank === "MVP_PLUS" && player.monthlyPackageRank === "SUPERSTAR") {
        rank = "MVP_PLUS_PLUS"
    }
    
    switch (player.rank) {
        case "YOUTUBER":
            rank = "YOUTUBER"
            break;
        case "STAFF":
            rank = "STAFF"
            break;
    }

    const customPrefixMap = new Map<string, string>([
        ["§d[PIG§b+++§d]", "PIG_PLUS_PLUS_PLUS"],
        ["§d[INNIT]", "INNIT"],
        ["§6[MOJANG]", "MOJANG"],
        ["§6[EVENTS]", "EVENTS"],
    ])
    if (customPrefixMap.has(player.prefix)) {
        rank = customPrefixMap.get(player.prefix)
    }

    return rank
}

export function normalizeUUID(uuid: string) {
    if (!uuid.includes("-")) {
        return [uuid.slice(0, 8), uuid.slice(8, 12), uuid.slice(12, 16), uuid.slice(16, 20), uuid.slice(20)].join('-')
    }

    return uuid
}

export function formatWord(word: string): string {
    return word.replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase())
}

export function truncateString(str: string, maxLength: number) {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength).trim() + '...';
}

export function formatCosmetic(cosmetic: string) {
    if (cosmetic.startsWith("death_effect_")) {
        return cosmetic.replace("death_effect_", "").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    } else if (cosmetic.startsWith("particle_")) {
        return cosmetic.replace("particle_", "").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    } else {
        return cosmetic.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    }
}

export const particles = [
    "particle_water",
    "particle_snow",
    "particle_slime",
    "particle_redstone",
    "particle_rainbow",
    "particle_portal",
    "particle_note",
    "particle_magic",
    "particle_lava",
    "particle_heart",
    "particle_happy",
    "particle_golden",
    "particle_flame",
    "particle_firework",
    "particle_enchant",
    "particle_crayon",
]

export const deathEffects = [
    "death_effect_eggsplosion",
    "death_effect_royalty",
    "death_effect_rising_dragon",
    "death_effect_pinata",
    "death_effect_smash",
    "death_effect_snowplosion",
    "death_effect_xp_orb",
    "death_effect_halloweeny",
    "death_effect_raining_gold",
    "death_effect_cookie_fountain",
    "death_effect_beef_everywhere",
    "death_effect_squid_missile",
    "death_effect_wither",
    "death_effect_tnt",
    "death_effect_blood_explosion",
    "death_effect_heart_aura",
    "death_effect_creeper",
    "death_effect_lightning_strike",
    "death_effect_firework",
]

export const suits = [
    "spooky",
    "pastel",
    "disco",
    "ocean",
    "sunrise",
    "tnt",
    "shiny",
    "budder",
    "medieval",
    "fashionista",
    "snow",
    "slime",
    "space",
    "revenge",
    "invader",
    "special_ops",
    "swat",
    "marine",
    "commander",
    "majestic",
    "elite",
    "soldier",
];

export const hats = [
    "thick_ice",
    "cheese",
    "candy_cane",
    "final",
    "grand_master",
    "master",
    "moolah",
    "explosive_cap",
    "luxurious_hat",
    "magic",
    "nobility_hat",
    "kings_crown",
    "nature",
    "lapis",
    "hat_of_undeniable_wealth_and_respect",
    "bounty_hat",
    "treasure_hat",
    "spaceman_helmet",
    "frying_pan",
    "over_the_rainbow",
    "rainbow_glitch",
    "fox",
    "egyptian_queen",
    "the_attendant",
    "the_superfan",
    "the_milkman",
    "batters_helmet",
    "bankers_draught",
    "goldigger",
    "lumberjack_hat",
    "desert_hat",
    "miners_hat",
    "canada_hat",
    "scotland_hat",
    "monitor",
    "burger",
    "clownfish",
    "bee",
    "bird",
    "koala",
    "polar_bear",
    "luminous_hat",
    "bakers_hat",
    "wither_skull",
    "skeleton_skull",
    "zombie_skull",
    "creeper_head",
    "halloween_hat",
    "steve",
    "scholars_cap",
    "winter_hat",
    "summer_hat",
];
