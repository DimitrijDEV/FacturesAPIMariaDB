const getResponse = (resultBool, data, message) => {
    return (
        {
            resultBool,
            data,
            message
        }
    );
}

exports.getResponse = getResponse;