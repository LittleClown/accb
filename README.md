# 安装
```
npm install -g accb
```


`accb`(acm-cpp-code-build) 是一个命令行工具，作用是将本地引入的头文件替换到源代码中。
例如，在 `A.cpp` 中有 `#include <lemon-clown/algorithm/netflow/isap.hpp>`，
通过 `accb build A.cpp` 可以将 `lemon-clown/algorithm/netflow/isap.hpp` 中的代码替换进 `A.cpp` 中。

这样做的目的是，在 ACM 编程中，只能提交单文件代码，但是很多算法其实没必要每次都写（特别是一些复杂数据结构），
当然，直接通过复制粘贴的方式也可以很轻易的复用代码，但是实在是太丑陋了。
如果有一个工具可以将代码直接合并进一个源文件中，甚至做一些压缩操作，就可以很方便了。


# 全局参数
* `--help`: 显示帮助信息
* `--log-*`: 见 ***[emm-logger](https://www.npmjs.com/package/emm-logger)***
* `--cmake-lists <cmakelists-name>`: 指定项目的 cmake 文件的文件名，默认值为 `CMakeLists.txt`


# accb build <target>
```
accb build <target> [--help]  [-o, --out <out-filename>] [-d, --dir <out-directory>] [--rc, --remove-comments] [--rs, --remove-spaces] [-u, --uglify]
```

## 参数
* `target`: 需要生成的源文件
* `--out <out-filename>`: 导出文件名，若不指定，默认为 `target` 的后缀名前加上 `.out`。如 `target=A.cpp` 时，默认导出名为 `A.out.cpp`
* `--dir <out-directory>`: 导出目录，若不指定，默认为执行命令的当前路径
* `--remove-comments`: 删除导出的文件中的注释
* `--remove-spaces`: 删除导出的文件中的冗余空格
* `--uglify`: `--remove-comments --remove-spaces` 的快捷方式


## 使用
```shell
accb build 10480.cpp --file A.cpp --remove-comments --remove-spaces
```
这条命令将会把 `10480.cpp` 中依赖的本地代码（`#include`）声明替换相应的代码，并将最后生成的代码输出到 `A.cpp` 中，
`--remove-comments` 选项将会去掉 `A.cpp` 中的所有注释，`--remove-spaces` 将会去掉 `A.cpp` 中的所有空格（请放心，它绝不会去掉引号中的空格）


# accb new <targets...>
```
accb new <targets...> [-t, --template <template-path>]
```

## 参数
* `targets`: 可变参数列表，用于指定需要创建的文件列表，如果未指定后缀名， 将默认以 `.cpp` 为后缀，并将在 `CMakeLists.txt` 下自动添加相应的可执行文件条目（为了在 CLion 中直接执行）
* `--template <template-path>`: 指定代码模板路径（以执行命令的路径为相对路径），该参数默认值为当前工程根目录下（`CMakeLists.txt` 所在的目录）的 `template.cpp`，
若该参数指定的值是一个文件，则会将文件中的内容复制到新创建的文件中

## 使用
```shell
accb new A B C D --template t.cpp --log-level=info
```
这条命令将在当前文件下创建 4 个文件：`A.cpp`，`B.cpp`，`C.cpp`，`D.cpp`。并在 `CMakeLists.txt` 中添加相应的条目，
若当前文件夹下存在文件 `t.cpp`，则将会把 `t.cpp` 的内容复制到新创建的四个文件中，`--log-level=info` 使得你可以在控制台中看到执行过程产生的一些信息


# 说明
本项目是我自己做着用的（作为 ***[acm-cpp](https://github.com/LittleClown/acm-cpp)*** 的配套工具），我使用 Clion 编写代码，通过 `cmake` 来管理。
因此，如果你希望它能正常工作，请先创建一个 C++ 工程，并把你的类库通过 `include_directories` 指定，等等。
