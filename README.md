`accb`(acm-cpp-code-build) 是一个命令行工具，作用是将本地引入的头文件替换到源代码中。
例如，在 `A.cpp` 中有 `#include <lemon-clown/algorithm/netflow/isap.hpp>`，
通过 `accb build A.cpp` 可以将 `lemon-clown/algorithm/netflow/isap.hpp` 中的代码替换进 `A.cpp` 中。

这样做的目的是，在 ACM 编程中，只能提交单文件代码，但是很多算法其实没必要每次都写（特别是一些复杂数据结构），
当然，直接通过复制粘贴的方式也可以很轻易的复用代码，但是实在是太丑陋了。
如果有一个工具可以将代码直接合并进一个源文件中，甚至做一些压缩操作，就可以很方便了。


# 说明
本项目是我自己做着用的，我使用 Clion 编写代码，通过 `cmake` 来管理。
