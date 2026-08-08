// setupFetch.js
// Overrides the global fetch to implement JWT token intercepting and automatic refresh.

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  let [resource, config] = args;

  // 1. Perform the original fetch request
  let response = await originalFetch(resource, config);

  // 2. If the response is 401 Unauthorized, attempt to refresh the token
  // Ignore 401s on the login endpoint, as they indicate incorrect credentials
  const isLoginRequest = typeof resource === 'string' && resource.includes('/accounts/login/');
  
  if (response.status === 401 && !isLoginRequest) {
    const refreshToken = localStorage.getItem("refreshTokens");

    if (refreshToken) {
      try {
        // Call refresh endpoint directly using originalFetch to avoid infinite loops
        const refreshResponse = await originalFetch(
          "http://127.0.0.1:8000/accounts/refresh/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
          }
        );

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          
          // Save the new tokens
          localStorage.setItem("accessTokens", data.access);
          if (data.refresh) {
            localStorage.setItem("refreshTokens", data.refresh);
          }

          // 3. Update the Authorization header for the retry
          if (config) {
            if (!config.headers) {
              config.headers = {};
            }
            if (config.headers instanceof Headers) {
              config.headers.set("Authorization", `Bearer ${data.access}`);
            } else {
              config.headers["Authorization"] = `Bearer ${data.access}`;
            }
          } else {
             config = {
                headers: {
                   "Authorization": `Bearer ${data.access}`
                }
             };
          }

          // 4. Retry the original request with the new token
          return await originalFetch(resource, config);
          
        } else {
          // Refresh token itself is invalid/expired
          throw new Error("Refresh token expired");
        }
      } catch (error) {
        console.error("Session expired.", error);
        localStorage.clear();
        alert("Your session has expired. Please log in again.");
        window.location.href = "/login";
      }
    } else {
      // No refresh token found
      localStorage.clear();
      alert("Your session has expired. Please log in again.");
      window.location.href = "/login";
    }
  }

  // Return the original response if it wasn't a 401
  return response;
};
