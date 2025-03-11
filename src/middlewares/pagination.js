const getPaginationData = (data, page, limit, req) => {
    const totalPages = Math.ceil(data.count / limit);
    return {
        current_page: page,
        data: data.rows,
        first_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=1`,
        from: (page - 1) * limit + 1,
        last_page: totalPages,
        last_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${totalPages}`,
        next_page_url: page < totalPages ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}` : null,
        prev_page_url: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}` : null,
        path: `${req.protocol}://${req.get("host")}${req.baseUrl}`,
        per_page: limit,
        to: (page - 1) * limit + data.rows.length,
        total: data.count,
    };
};

module.exports = getPaginationData;
