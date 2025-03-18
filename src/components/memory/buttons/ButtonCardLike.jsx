import { useState } from "react";
import PropTypes from "prop-types";
import SolarChatRoundLikeLineDuotone from "@/components/icons/SolarChatRoundLikeLineDuotone";
import SolarChatRoundLikeBold from "@/components/icons/SolarChatRoundLikeBold";
import { actions } from "astro:actions";
import { firebase } from "@/firebase/config";
import { showNotify } from "@/utils/popsNotification";

const handleLikeDislike = async (id, updateStatuLike, updateLikeValue) => {
    const loginModal = document.getElementById("login-modal");
    const userCurrent = firebase.auth.currentUser;

    if (!userCurrent) {
        showNotify("Debe iniciar sesión para poder darle like al álbum 😥")
        loginModal.showModal();
        return
    };

    const { data, error } = await actions.Memory.handleLikeDislike({ albumId: id });

    if (error) {
        console.log(`error al darle like al album: ${error}`);
        return;
    };
    if (!data || !data.success) return;

    const { statusLike, likes } = data;

    updateLikeValue(likes);
    updateStatuLike(statusLike);
};


const ButtonLike = ({ isLiked, albumId, likeValue }) => {
    const [isLike, setIsLike] = useState(isLiked);
    const [likes, setLikes] = useState(likeValue);

    const id = albumId;

    return (
        <span
            onClick={() => handleLikeDislike(id, setIsLike, setLikes)}
            className={`${isLike ? "text-orange-600" : ""} flex flex-row items-center gap-1 btn`}
        >{
                isLike ? (
                    <SolarChatRoundLikeBold />
                ) : (
                    <SolarChatRoundLikeLineDuotone />
                )
            }
            <span className="text-black">{likes}</span>
        </span>
    )
};

ButtonLike.propTypes = {
    isLiked: PropTypes.bool.isRequired,
    albumId: PropTypes.number.isRequired,
    likeValue: PropTypes.number.isRequired
};

export default ButtonLike;