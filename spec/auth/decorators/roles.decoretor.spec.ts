import { Roles, ROLES_KEY } from '../../../src/auth/decorators/roles.decoretor';

describe('Roles Decorator', () => {
  it('should set ROLES_KEY metadata with provided roles', () => {
    const roles = ['admin', 'user'];
    class TestClass {
      @Roles(...roles)
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      TestClass.prototype.testMethod,
    ) as string[];
    expect(metadata).toEqual(roles);
  });
});
