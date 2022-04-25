
function formatToPriceToShorten(num = 0, decimals = 0) {
    // Ensure number has max 3 significant digits (no rounding up can happen)
    let i = Math.pow(10, Math.max(0, Math.log10(Math.abs(num)) - 2));
    let absNumber = Math.abs(num) / i * i;
    let realNumber = num < -1 ? absNumber * -1 : absNumber

    if (absNumber >= 1_000_000_000)
        return (realNumber / 1_000_000_000).toFixed(decimals) + "B";
    if (absNumber >= 1_000_000)
        return (realNumber / 1_000_000).toFixed(decimals) + "M";
    if (absNumber >= 1_000)
        return (realNumber / 1_000).toFixed(decimals) + "k";

    return realNumber.toFixed(0)
}

function numberWithThousandsSeperators(number, seperator) {
    if (!number) {
        return "0";
    }
    var parts = number.toString().split(",");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, seperator || ",");
    return parts.join(",");
}

module.exports = {
numberWithThousandsSeperators,
formatToPriceToShorten
}