__all__ = [
    'ZKSDKError'
]
from .enums import PULL_SDK_ERRORS, WSA_ERROR_CODES


class ZKSDKError(Exception):
    """Error occured in PULL SDK function. Supports description of
    errors caused by PULL SDK and WINSOCK
    """
    def __init__(self, msg: str, err: int, *args):
        super().__init__((msg, *args))
        self.err = int(err)
        self.msg = msg

    def __str__(self):
        if self.err in PULL_SDK_ERRORS:
            descr = f'SDK error {self.err}: {PULL_SDK_ERRORS[self.err].__doc__}'
        elif self.err in WSA_ERROR_CODES:
            descr = f'WINSOCK error {self.err}: {WSA_ERROR_CODES[self.err].__doc__}'
        else:
            descr = f'Unknown error {self.err}'

        return f'{self.msg}: {descr}'
