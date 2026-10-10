import type { Location } from '@/app/api/generated/KoriApi';
import type { LabelPicker, RoomInfo } from './types';

export const mapLocations = (locations: Location[], label: LabelPicker): Record<string, RoomInfo> =>
  Object.fromEntries(
    locations.flatMap((location) =>
      location.id
        ? [
            [
              location.id,
              {
                id: location.id,
                name: label(location.name) ?? location.id,
                building: location.building ? label(location.building.name) : null,
              },
            ],
          ]
        : [],
    ),
  );
