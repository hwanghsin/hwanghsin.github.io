
// Methods
async function authenticate(token) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`
        }
    }
    const res = await (await fetch(`${url}/api/users/authenticate`, options)).json();
    return res;
}

async function fetchMyInfo(token) {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`
        }
    }
    const res = await (await fetch(`${url}/api/users/me`, options)).json();
    switch (res.code) {
        case SUCCESS:
            return res.user;
        default:
            return null;
    }
}