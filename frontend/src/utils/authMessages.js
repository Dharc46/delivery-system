export const AUTH_FLASH_MESSAGE_KEY = 'delivery-system.auth.flashMessage';

export const AUTH_MESSAGES = {
    unauthorized: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
    forbidden: 'Bạn không có quyền truy cập vào chức năng này.',
};

export const setAuthFlashMessage = (message) => {
    if (typeof window === 'undefined') {
        return;
    }

    sessionStorage.setItem(AUTH_FLASH_MESSAGE_KEY, message);
};

export const consumeAuthFlashMessage = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    const message = sessionStorage.getItem(AUTH_FLASH_MESSAGE_KEY) || '';
    if (message) {
        sessionStorage.removeItem(AUTH_FLASH_MESSAGE_KEY);
    }

    return message;
};
