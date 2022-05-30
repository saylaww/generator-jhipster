/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect } from 'expect';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { skipPrettierHelpers as helpers } from '../../test/utils/utils.mjs';
import { insertContentIntoApplicationProperties } from './needles.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorPath = join(__dirname, 'index.js');
const generator = basename(__dirname);

describe(`JHipster ${generator} generator`, () => {
  describe('generated project', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorPath);
    });

    it('should match state snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });

    describe('using insertContentIntoApplicationProperties needle', () => {
      it('with a non existing needle', () => {
        expect(() => insertContentIntoApplicationProperties(runResult.generator, { foo: 'foo' })).toThrow(
          /Missing required jhipster-needle application-properties-foo not found at/
        );
      });

      it('without a needle', () => {
        expect(() => insertContentIntoApplicationProperties(runResult.generator, {})).toThrow(/At least 1 needle is required/);
      });

      describe('when applied', () => {
        const fileRegexp = /config\/ApplicationProperties.java/;
        const property = 'private Foo foo;';
        const propertyGetter = `
    private Foo getFoo() {
        return foo;
    };`;
        const propertyClass = `
        public static Foo{} {
            private String bar;

            public String getBar() {
              return bar;
            }
        };`;
        let snapshot;

        before(() => {
          insertContentIntoApplicationProperties(runResult.generator, { property, propertyGetter, propertyClass });
          snapshot = runResult.getSnapshot(file => fileRegexp.test(file.path));
        });

        it('should match snapshot', () => {
          expect(snapshot).toMatchInlineSnapshot(`Object {}`);
        });

        it('should not be add the content at second call', () => {
          insertContentIntoApplicationProperties(runResult.generator, { property, propertyGetter, propertyClass });
          expect(runResult.getSnapshot(file => fileRegexp.test(file.path))).toEqual(snapshot);
        });

        it('should not be add new content with prettier differences', () => {
          insertContentIntoApplicationProperties(runResult.generator, { property: '  private   Foo   foo;' });
          expect(runResult.getSnapshot(file => fileRegexp.test(file.path))).toEqual(snapshot);
        });

        it('should not be add new content with prettier differences and new lines', () => {
          insertContentIntoApplicationProperties(runResult.generator, {
            property: `  private Foo getFoo() {

        return foo;

    };
`,
          });
          expect(runResult.getSnapshot(file => fileRegexp.test(file.path))).toEqual(snapshot);
        });
      });
    });
  });
});
