$(document).ready(async () => {
    const token = localStorage.getItem('_token');
    if (token) {
        const res = await authenticate(token);
        if (res.code == FAILED) return window.location.pathname = 'login.html';
    } else {
        return window.location.pathname = 'login.html';
    }
    // 初始
    const user = await fetchMyInfo(token);
    if (user) $('#your-kname').text(`歡迎！${user.kname}`);
    handleLLoadData(user);
    // Events
    // $('#upload-avatar').on('click', async function() {
    //     $('#upload-input').trigger('click');
    // });
    // $('#upload-input').on('change', async function() {
    //     const input = document.getElementById('upload-input');
    //     const src = await uploadAvatar({ token, file: input.files[0] });
    //     if (src) {
    //         $('.avatar').attr('src', src);
    //     }
    // });
    $('#update').on('click', function() {
        $('#submit').attr('name', 'info');
        $('#confirmation .modal-body h4').text('確定更新個人資料？');
        $('#confirmation #submit').text('確認更新');
        $('#confirmation').modal('show');
    });
    $('#update-password').on('click', function() {
        $('#submit').attr('name', 'pass');
        $('#confirmation .modal-body').append(`
            <input type="password" id="password" placeholder="請輸入新密碼" />
        `);
        $('#confirmation #submit').text('更新密碼');
        $('#confirmation').modal('show');
    });
    $('#submit').on('click', async function() {
        const name = $(this).attr('name');
        switch (name) {
            case 'pass':
                const password = $('#password').val();
                const newPassword = await updatePassword({ token, password });
                if (newPassword) {
                    $('#confirmation').modal('hide');
                    showToast(`密碼已更新`);
                }
                break;
            case 'info':
                const user = {
                    lname: $('#lname').val(),
                    fname: $('#fname').val(),
                    kname: $('#kname').val(),
                    status: $('#status').val()
                }
                const newUser = await updateInfo({ token, user });
                if (newUser) {
                    $('#your-kname').text(`歡迎！${newUser.kname}`);
                    $('#confirmation').modal('hide');
                    showToast(`資料已更新`);
                }
                break;
        }
    });
    $('#signout-btn').on('click', function() {
        localStorage.removeItem('_token');
        return window.location.pathname = 'login.html';
    });
    // Methods
    async function handleLLoadData(user) {
        $('#lname').val(user.lname);
        $('#fname').val(user.fname);
        $('#kname').val(user.kname);
        $('#status').val(user.status || '');
        $('#account').text(`帳號：${user.account}`);
        user.avatar && convertToBase64(user.avatar.data, base64 => {
            $('.avatar').attr('src', base64);
        });
        $('.loading').addClass('disappear');
        $('.loaded').removeClass('disappear');
    }
});

async function updateInfo({ token, user }) {
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`
        },
        body: JSON.stringify(user)
    }
    const res = await (await fetch(`${url}/api/users/me`, options)).json();
    switch (res.code) {
        case SUCCESS:
            return user;
        default:
            return null;
    }
}

async function updatePassword({ token, password }) {
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`
        },
        body: JSON.stringify({ password })
    }
    const res = await (await fetch(`${url}/api/users/me/password`, options)).json();
    switch (res.code) {
        case SUCCESS:
            return password;
        default:
            return null;
    }
}

// async function uploadAvatar({ token, file }) {
//     const formData = new FormData();
//     formData.append('avatar', file)
//     const options = {
//         method: 'PUT',
//         headers: {
//             'Authorization': `bearer ${token}`
//         },
//         body: formData
//     }
//     const res = await (await fetch(`${url}/api/users/me/avatar`, options)).json();
//     switch (res.code) {
//         case SUCCESS:
//             return (await toBase64(file));
//         default:
//             return null;
//     }
// }