import type { FunctionalComponent } from 'vue';
import type { IconNode, LucideProps } from 'lucide-vue-next';
import type { AccountType } from '@/enums/account-type';

export interface UserType {
  type: AccountType;
  icon: FunctionalComponent<LucideProps>;
  iconBgClass: string;
  iconTextColorClass: string;
  title: string;
  description: string;
  youAreList: string[];
  youCanList: string[];
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary";
}
