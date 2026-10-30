# NCM Decryptor
网易云音乐 `.ncm` 格式解密脚本，批量将 ncm 文件解密导出为 MP3。
> ⚠️ 仅用于**本人会员已下载音乐的本地备份**，禁止商用、二次分发、传播解密后的音频文件，一切违规行为由使用者自行承担。

## 简介
这是一份基于经典开源 ncm 解密算法的 Python 脚本，遍历指定目录下所有 `.ncm` 文件，自动解密并输出 `.mp3`。
> 局限性：该算法为老旧解密方案，**仅支持早期版本的 ncm 文件**；新版加密的 ncm 会解密失败、抛出断言错误。
> 若原音频本身是 flac 无损，强制输出 mp3 后缀后文件无法正常播放。

## 环境依赖
Python >= 3.6
```bash
pip install pycryptodome
## 使用方法

1. 将脚本 `ncm_decrypt.py` 放到任意位置
2. 修改脚本内 `base_dir` 路径，指向你的网易云 VIP 下载目录
```
base_dir = r"D:\CloudMusic\VipSongsDownload"
```
3. 运行脚本
```
python ncm_decrypt.py
```
4. 解密成功后，同目录生成同名 `.mp3` 文件

## 文件说明

- `ncm_decrypt.py`：主解密脚本
- `README.md`：项目说明文档

## 常见问题

1. `AssertionError`
文件为新版加密 ncm，本脚本不支持解密。
2. 解密出来的音频无法播放
源文件是 flac 无损音频，本脚本强制输出 mp3，不兼容。
3. ModuleNotFoundError: No module named 'Cryptodome'
执行 `pip install pycryptodome` 安装依赖。

## License

本项目仅作学习交流，不提供任何版权相关授权。