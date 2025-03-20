import { login, logOut } from "./auth/index.action"
import { addMemory, addShare, getAlbums, getAlbumForID, handleLikeDislike, addComment, uploadImage } from "./memory"
import { add } from "./subscribe"
import { isInvited, get } from "./invited"

export const server = {
    Subscribe: {
        add
    },
    Google: {
        login,
        logOut
    },
    Invited: {
        isInvited,
        get
    },
    Memory: {
        addMemory,
        addComment,
        addShare,
        uploadImage,
        getAlbums,
        handleLikeDislike,
        getAlbumForID
    }
}