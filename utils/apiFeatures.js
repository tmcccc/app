class ApiFeatures {
  constructor(query, paramsQueryObj) {
    this.query = query;
    this.paramsQueryObj = paramsQueryObj;
  }

  filterQuery() {
    const { ...queryObj } = this.paramsQueryObj; //desructuring cretes a new object -deep copy!
    console.log(this.paramsQueryObj);
    //const queryObj = Object.assign({},req.query); another way of creating a object

    //1.we exclude the un neccesry fileds -filter
    const excludeFields = ['sort', 'page', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    //2. we check to se is the query contains lt,lte,gt,gte -filter
    let stringQuery = JSON.stringify(queryObj); //converts the object to a string
    stringQuery = stringQuery.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    ); ///re[lace is a functio of String:prototype]

    console.log(JSON.parse(stringQuery));
    //retuens the query that we builded
    this.query = this.query.find(JSON.parse(stringQuery)); //converts the string to a object. this wiil retun a query

    return this;
  }

  sortingQuery() {
    if (this.paramsQueryObj.sort) {
      const sortBy = this.paramsQueryObj.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      console.log(sortBy);
    } else this.query = this.query.sort('-createdAt');

    return this;
  }

  fieldsquery() {
    //4.fields
    if (this.paramsQueryObj.fields) {
      const fieldsBy = this.paramsQueryObj.fields.split(',').join(' ');
      console.log(fieldsBy);
      this.query = this.query.select(fieldsBy);
    } else this.query = this.query.select('-createdAt');

    return this;
  }

  pagingQuery() {
    //5.paging

    if (this.paramsQueryObj.page || this.paramsQueryObj.limit) {
      const page = this.paramsQueryObj.page * 1 || 1; //can convert string also by *1
      const limit = this.paramsQueryObj.limit * 1 || 10; //can convert string also by *1
      this.query = this.query.skip((page - 1) * limit).limit(limit);
    }

    return this;
  }
}

module.exports = ApiFeatures;
