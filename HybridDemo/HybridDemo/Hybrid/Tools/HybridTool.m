//
//  HybridTool.m
//  Hybrid
//
//  Created by 蚩尤 on 16/2/23.
//  Copyright © 2016年 ouer. All rights reserved.
//

#import "HybridTool.h"
#import <objc/runtime.h>
#import "NSString+Sha1.h"
@implementation HybridTool
#pragma mark -isStringEmpty
+ (BOOL)isStringEmpty:(NSString *)str {
    if (![str isKindOfClass:[NSString class]]) {
        str = str.description;
    }
    if (str == nil || str == NULL) {
        return YES;
    }
    if ([str isEqualToString:@"(null)"]) {
        return YES;
    }
    if ([str isEqualToString:@"<null>"]) {
        return YES;
        
    }
    if ([str isKindOfClass:[NSNull class]]) {
        return YES;
    }
    if ([str isEqualToString:@"(null)(null)"]) {
        return YES;
    }
    if ([[str stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] length]==0) {
        return YES;
    }
    return NO;
}
//获取定义的属性字典
+ (NSDictionary *)hybridProperties
{
    NSString * propertiesPath = [[NSBundle mainBundle] pathForResource:@"Resource.bundle/webapp/ios_hybrid.properties" ofType:nil];
    NSData *data = [NSData dataWithContentsOfFile:propertiesPath];
    NSDictionary *properties = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:NULL];
    return properties;
}

+ (NSDictionary *)HybridErrorProperties
{
    NSString * propertiesPath = [[NSBundle mainBundle] pathForResource:@"Resource.bundle/webapp/ios_error_hybrid.properties" ofType:nil];
    NSData *data = [NSData dataWithContentsOfFile:propertiesPath];
    NSDictionary *properties = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:NULL];
    return properties;
}
//获取参数字典
+ (NSMutableDictionary *)paramDicWithQuery:(NSString *)query {
    NSArray *paramArr = [query componentsSeparatedByString:@"&"];
    NSMutableDictionary *paramDic = [NSMutableDictionary dictionary];
    for (NSString *str in paramArr) {
        NSString *key = nil;
        NSString *value = nil;
        NSRange range = [str rangeOfString:@"="];
        if (range.length > 0) {
            NSRange range = [str rangeOfString:@"="];
            key = [str substringToIndex:range.location];
            value = [str substringFromIndex:range.location+range.length];
            [paramDic setValue:value forKey:key];
        }
    }
    return paramDic;
}

+ (NSUInteger)getSize {
    NSUInteger size = 0;
    NSFileManager *fileManager = [NSFileManager new];
    NSString *cachesPath = [self cachesPath];
    NSDirectoryEnumerator *fileEnumerator = [fileManager enumeratorAtPath:cachesPath];
        for (NSString *fileName in fileEnumerator) {
            NSString *filePath = [cachesPath stringByAppendingPathComponent:fileName];
            NSDictionary *attrs = [[NSFileManager defaultManager] attributesOfItemAtPath:filePath error:nil];
            size += [attrs fileSize];
        }
    return size;
}

+ (NSString *)cachesPath {
    NSFileManager *fileManager = [NSFileManager new];
    NSString *cachesPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) lastObject];
    cachesPath = [cachesPath stringByAppendingPathComponent:@"com.davebella.default"];
    if (![fileManager fileExistsAtPath:cachesPath]) {
        [fileManager createDirectoryAtPath:cachesPath withIntermediateDirectories:YES attributes:nil error:NULL];
    }
//    DLog(@"cachesPath ==  %@",cachesPath);
    return cachesPath;
}

+ (NSString *)cachePathForRequest:(NSURLRequest *)aRequest
{
    NSString *cachesPath = [self cachesPath];
    NSString *fileName = [[[aRequest URL] absoluteString] sha1];
    NSString *path = [cachesPath stringByAppendingPathComponent:fileName];
//    DLog(@"path ==  %@",path); //这个文件是否被缓存下来
    return path;
}

+ (void)clearCache
{
    NSFileManager *fileManager = [NSFileManager new];
    NSString *cachesPath = [self cachesPath];
    [fileManager removeItemAtPath:cachesPath error:nil];
    [fileManager createDirectoryAtPath:cachesPath
            withIntermediateDirectories:YES
                             attributes:nil
                                  error:NULL];
}

@end
