import { ErrorResponseDto } from '../../../src/common/dto/error-response.dto';

describe('ErrorResponseDto', () => {
  it('should create an instance with correct properties', () => {
    const dto = new ErrorResponseDto();
    dto.statusCode = 400;
    dto.error = 'Bad Request';
    dto.message = 'Validation failed';

    expect(dto).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
    });
  });
});
