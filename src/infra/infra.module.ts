import { Module, Global } from '@nestjs/common';

import { ItemStoreModule } from '@infra/stores/item/item-store.module';

@Global()
@Module({
  imports: [ItemStoreModule],
  exports: [ItemStoreModule],
})
export class InfraModule {}
