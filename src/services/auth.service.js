import api from "../api/axios"

export const registerUser = async (data) => {
     try {
    const response = await api.post("/auth/register", data);

    return response.data;
  } catch (error) {
    console.log("REGISTER API ERROR:", error.response?.data);
    console.log("REGISTER STATUS:", error.response?.status);
    throw error;
  }
};


export const loginUser = async (data) => {
    const response = await api.post("/auth/login", data);
 console.log("login------", response.data);
    return response.data;
     
}

export const logoutUser = async () => {
    const response = await api.post("/auth/logout");
    return response.data
}

export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const response = await api.post("/auth/verify-reset-otp", {
    email,
    otp,
  });

  return response.data;
};

export const resendResetOtp = async (email) => {
  const response = await api.post("/auth/resend-reset-otp", {
    email,
  });

  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post(
    "/auth/reset-password",
    data
  );

  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(
    `/auth/verify-email/${token}`
  );

  return response.data;
};