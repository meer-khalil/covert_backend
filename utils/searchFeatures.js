class SearchFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = Object.fromEntries(
            Object.entries(queryString).map(([key, value]) => [key, value === 'true' || value === 'false' ? JSON.parse(value) : value])
        );

        console.log('QueryString: ', this.queryString);
    }

    search() {
        const keyword = this.queryString.keyword ? {
            name: {
                $regex: this.queryString.keyword,
                $options: "i",
            }
        } : {};

        // console.log(keyword);

        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {


        // console.log(JSON.parse(queryString));

        // if the rentalicome is atleast 1% of price, retrieve the document.
        if (this.queryString['1% rule']) {
            this.query = this.query.find({
                $expr: {
                    $gte: [
                        { $multiply: ['$rentalIncome', 100] },
                        '$newPrice'
                    ]
                }
            })
        }

        // if discount applied
        if (this.queryString['Price Reduced']) {
            this.query = this.query.find({ reducedPrice: { $ne: 0 } })
        }

        // occupancy > 0
        if (this.queryString['Occupied']) {
            this.query = this.query.find({ occupancy: { $ne: 0 } })
        }

        if (this.queryString['Seller Financing']) {
            this.query = this.query.find({ finance_sellerFinance: true })
        }

        if (this.queryString['Conventional']) {
            this.query = this.query.find({ finance_mortgage: true })
        }

        if (this.queryString['Cash']) {
            this.query = this.query.find({ finance_cash: true })
        }

        if (this.queryString['propertyType']) {
            this.query = this.query.find({ propertyType: this.queryString['propertyType'] })
        }

        if (this.queryString['state']) {
            this.query = this.query.find({ state: this.queryString['state'] })
        }

        if (this.queryString['showHome']) {
            this.query = this.query.find({ showHome: this.queryString['showHome'] })
        }

        if (this.queryString['published']) {
            this.query = this.query.find({ published: this.queryString['published'] })
        }
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryString.page) || 1;

        const skipProducts = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skipProducts);
        return this;
    }
};

module.exports = SearchFeatures;

/*
    There are two attributes in mongodb schema.
    price
    rentalIncome
    if the rental income is atleast the 1% of price query that document.
    How to do it with mongoose?
*/