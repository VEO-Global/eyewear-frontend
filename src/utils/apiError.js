export function getApiErrorMessage(error, fallbackMessage = "Có lỗi xảy ra. Vui lòng thử lại.") {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];

    if (typeof firstError === "string" && firstError.trim()) {
      return firstError;
    }

    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  return fallbackMessage;
}

export function mapValidationErrors(error) {
  const responseData = error?.response?.data;
  const sourceErrors = responseData?.errors;

  if (!sourceErrors) {
    return {};
  }

  if (Array.isArray(sourceErrors)) {
    return sourceErrors.reduce((result, item, index) => {
      if (typeof item === "string" && item.trim()) {
        result[`field_${index}`] = item;
      } else if (item?.field && item?.message) {
        result[item.field] = item.message;
      }

      return result;
    }, {});
  }

  if (typeof sourceErrors === "object") {
    return Object.entries(sourceErrors).reduce((result, [field, value]) => {
      if (Array.isArray(value)) {
        result[field] = value[0];
      } else if (typeof value === "string") {
        result[field] = value;
      }

      return result;
    }, {});
  }

  return {};
}
