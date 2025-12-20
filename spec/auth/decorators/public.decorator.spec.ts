import {
  IS_PUBLIC_KEY,
  Public,
} from '../../../src/auth/decorators/public.decorator';

describe('Public Decorator', () => {
  it('should set IS_PUBLIC_KEY metadata to true', () => {
    class TestClass {
      @Public()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      TestClass.prototype.testMethod,
    );
    expect(metadata).toBe(true);
  });
});
