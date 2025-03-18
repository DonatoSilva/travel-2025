export const showNotify = (text) => {
    const notification = document.querySelector(
        "#notification",
    );

    if (!notification) {
        console.error("Notification element not found");
        return;
    }

    notification.classList.remove("show");
    void notification.offsetWidth;
    notification.textContent = text;
    notification.classList.add("show");
};