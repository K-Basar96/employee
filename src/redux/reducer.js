const reducer = (data = [], action) => {
  // console.log("reducer called", action);
  switch (action.type) {
    case "TOKEN":
      return { token: action.token, ...data };
    default:
      return data;
  }
}

export default reducer
