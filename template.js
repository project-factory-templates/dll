import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { rename, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

export default {
    message: 'Select a language:',
    routes: [
        {
            message: chalk.blue('C'),
            directory: 'c',
            tag: 'c'
        },
        {
            message: chalk.magenta('C++'),
            directory: 'cpp',
            tag: 'cpp'
        }
    ],
    promptScript: [
        {
            name: 'DLLNAME',
            type: 'text',
            message: 'DLL name:'
        },
        {
            name: 'PREF',
            type: 'text',
            message: 'Root namespace name:'
        },
        {
            name: 'AUTHOR',
            type: 'text',
            message: 'Author:'
        },
        {
            name: 'BUILDDIR',
            type: 'text',
            message: 'Build directory:',
            initial: 'build'
        },
        {
            name: 'INCDIR',
            type: 'text',
            message: 'Include directory:',
            initial: 'include'
        },
        {
            name: 'LIBDIR',
            type: 'text',
            message: 'Library directory:',
            initial: 'lib'
        },
        {
            name: 'LIBS',
            type: 'list',
            message: 'Libraries:',
            separator: ' '
        }
    ],
    sharedDirectories: ['share'],
    onPromptSubmit: $ => {
        $.YEAR = new Date().getFullYear()
        $.DLLNAME_UPPER = $.DLLNAME.toUpperCase()
        $.LIBS = $.LIBS.filter(lib => lib.length > 0.5)
        $.GITIGNORE_LIBS = $.LIBS
            .flatMap(lib => [
                `/${$.INCDIR}/${lib}`,
                `/${$.INCDIR}/${lib}.h*`
            ])
            .join('\n')
        $.LD_LIBS = $.LIBS
            .map(lib => '-l' + lib)
            .join(' ')
        $.LIBS = $.LIBS.join(' ')
    },
    onResolving: ($, tag) => {
        $.LANG = tag
        $.EXT = tag

        if (tag === 'c') {
            $.COMPILER_EXEC = 'gcc'
            $.COMPILER_NAME = 'GCC'
        } else {
            $.COMPILER_EXEC = 'g++'
            $.COMPILER_NAME = 'GXX'
            $.ROOTNS = $.PREF
        }

        $.PREF = $.PREF.toUpperCase()
    },
    onScaffolded: async (dir, $) => {
        const incdir = join(dir, $.INCDIR)

        if ($.INCDIR !== 'inc') await rename(join(dir, 'inc'), incdir)
        if ($.DLLNAME !== 'thisdll') {
            const mainHeaderFileName = ($.USE_HPP ?? false)
                ? 'thisdll.hpp'
                : 'thisdll.h'

            await rename(join(incdir, 'thisdll'), join(incdir, $.DLLNAME))
            await rename(join(incdir, mainHeaderFileName), join(incdir, $.DLLNAME + ($.HDREXT ?? '.h')))
        }

        const srcDir = join(dir, 'src')
        const libDir = join(dir, $.LIBDIR)

        if (!existsSync(srcDir)) await mkdir(srcDir)
        if (!existsSync(libDir)) await mkdir(libDir)
    }
}
