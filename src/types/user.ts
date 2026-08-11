/** 앱 진입 시 선택하는 사용자 역할 */
export type UserRole = 'customer' | 'staff';

export interface BaseUser {
  id: string;
  name: string;
  role: UserRole;
}

/** 고객용 화면(app/customer)에서 사용하는 사용자 */
export interface Customer extends BaseUser {
  role: 'customer';
  phoneNumber?: string;
}

/** 직원용 화면(app/staff)에서 사용하는 사용자 */
export interface Staff extends BaseUser {
  role: 'staff';
  /** 소속 매장 식별자 */
  storeId: string;
}

export type User = Customer | Staff;
