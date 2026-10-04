# Kenney source and objective verification — 2026-10-04

Verified directly against a fresh download from the [official Furniture Kit page](https://kenney.nl/assets/furniture-kit) and its [official ZIP](https://kenney.nl/media/pages/assets/furniture-kit/440e0608a4-1677580847/kenney_furniture-kit.zip). The page labels its release 1.0; the archive's License.txt labels the pack 2.0. These labels remain separate in each object's metadata; the exact distribution is pinned by its archive hash.

- Archive SHA-256: `e67652d0932cee41683f74711c03d3e192a2af9979ef8e6b237711f5482d46b0`.
- Bundled License.txt SHA-256: `bc0de1a0742cb490f9ed4bae0bd284286ebb27e23149b9917c7d8c0d590b8b29`.
- The official page specifies CC0; the inspected bundled notice specifies CC0 and permits commercial projects, with optional credit. Evidence is at pack scope.

| Exact archive member | Bytes | SHA-256 | Meshes |
| --- | ---: | --- | ---: |
| `Models/GLTF format/computerKeyboard.glb` | 3,476 | `9d9135789de2120e9f41ce3f0a56dd1b15f40adcc7888739bb842a2d820da322` | 1 |
| `Models/GLTF format/books.glb` | 6,864 | `b8dc56e5d29f6fc1f4727fccb1b9642627fee9942c48060a00034e98df02701c` | 1 |
| `Models/GLTF format/pillow.glb` | 5,044 | `6fae7c190d0b676ef3efd35e5178cef21dffb5c80e1257d8b537ad424da0e5f6` | 1 |
| `Models/GLTF format/pottedPlant.glb` | 7,576 | `5b760eda2766f75fda36b2c5df652a1662f82981ef64cd8fa7fe7bcd386b3a15` | 2 |
| `Models/GLTF format/kitchenBlender.glb` | 18,728 | `f471defb5b2b1cf3b949a1a8aaef0a8b727afe662b0815068cf4e963325a3c1f` | 3 |

All five members are GLB 2.0, with no animation or skin. File lengths and SHA-256 values match the current bundle. Static geometry does not establish physics, scale, articulation, device function or successful robot execution; the task plans preserve these limits.

The current batch contains exactly five external objects, 20 tasks, 20 matching templates and 20 plans: four distinct bounded outcomes per object. Every task is atomic, has one formal goal predicate and matches its template goal. Independent review accepts the current revision in [codex_reference_kenney_furniture_kit_round1.md](codex_reference_kenney_furniture_kit_round1.md). The source-verification scope is explicit in [cross-source-expansion.md](../../docs/cross-source-expansion.md).

After merging origin/main at ca0691a, the seed validator reports 827 tasks and plans, 3,531 claims, 222 external objects and 77 YCB records. The coverage report proves 77/77 covered, 484 YCB-primary tasks and no missing objects. Final integration on 2026-10-05 passed `npm run check`: seed validation, research validation and all 38 tests. The all-seven draft check passed 145 tasks (51 atomic / 94 compound); Worker dry-run bundling also succeeded. Kenney is committed in `0e9fff7`, with its shared schema/vocabulary prerequisites in `f41669c`.
