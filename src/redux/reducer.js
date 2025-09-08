const reducer = (data = [], action) => {
  // console.log("reducer called", action);
  switch (action.type) {
    case "TOKEN":
      return { ...data, token: action.token };
    default:
      return data;
  }
}

export default reducer
