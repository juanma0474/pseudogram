import firebase from 'firebase';

const perfil = (perfil) => {
    return {
        type: "PERFIL",
        perfil
    }
};

const picturesPerfil = (pictures) => {
    return {
        type: 'LOAD_PICTURES_PERFIL',
        pictures
    }
}

const getUser = (user, callback) => {
    let userRef = firebase.database().ref('users').orderByChild('usuario').equalTo(user);
    userRef.once('value', (user) => {
        callback(user);
    })
}

export const btnSeguir = (userRequests, userFollow) => {

    return dispatch => {
        let bdFirebase = firebase.database()
        bdFirebase.ref('users/' + userRequests)
            .child("followed/" + userFollow)
            .set({ uid: userFollow })

        /*Seguidores */
        let followers = bdFirebase.ref('users/' + userFollow)
        followers.child("followers/" + userRequests)
            .set({ uid: userRequests })

        followers.once('value', (user) => {
            dispatch(perfil(user.val()));
        })
    }
}

export const userFollowed = (arrayFollowed, userUid) => {
    let arr = (arrayFollowed === undefined) ? {} : arrayFollowed;
    return dispatch => Object.keys(arr).includes(userUid)
}


export const loadPerfil = (id) => (dispatch) => {
    //.limitToLast(11)
    return new Promise(function(resolve) {
        getUser(id, (user) => {
            if (user.val() != null) {
                let keyID = Object.keys(user.val())[0];
                let userPerfil = user.child(keyID).val();
                dispatch(perfil(userPerfil));
                firebase.database().ref('pictures').orderByChild('uid').equalTo(keyID)
                    .on('child_added', snapshot => {
                        dispatch(picturesPerfil(snapshot.val()));
                    })
                resolve(true)
            } else {
                dispatch(perfil(null));
                resolve(false)
            }
        });
    })
}