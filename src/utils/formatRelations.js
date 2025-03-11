const models = require('../models'); // Import toàn bộ models

function formatRelations(relations) {
    return relations.map(rel => ({
        model: models[formatModelName(rel)], // Lấy model từ danh sách models
        as: rel // Giữ nguyên alias gốc
    }));
}

function formatModelName(relation) {
    return relation
        .replace(/_s$/, '')  // Loại bỏ `_s` ở cuối (nếu có)
        .replace(/s$/, '')   // Loại bỏ `s` ở cuối
        .split('_')          // Tách thành mảng từ dựa trên `_`
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu
        .join('');           // Nối lại thành PascalCase
}

module.exports = { formatRelations };
